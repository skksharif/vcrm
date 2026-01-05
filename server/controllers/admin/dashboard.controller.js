const PDFDocument = require('pdfkit');

const Client = require('../../models/client');
const User = require('../../models/user');
const Task = require('../../models/task');
const { TASK_TYPES, ROLES, INITIAL_TASK_STAGE } = require('../../models/constants');

/* =====================================================
   HELPER: DATE RANGE
   ===================================================== */
const getDateRange = (range) => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'day':
      start.setDate(now.getDate() - 1);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      start.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      start.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return { $gte: start, $lte: now };
};

/* =====================================================
   1. GET DASHBOARD STATS
   ===================================================== */
exports.getDashboard = async (req, res, next) => {
  try {
    /* ---------- CLIENTS ---------- */
    const clientCount = await Client.countDocuments({ isDeleted: false });

    /* ---------- USERS ---------- */
    const totalUsers = await User.countDocuments({ isDeleted: false });

    const usersByRole = {};
    for (const role of Object.values(ROLES)) {
      usersByRole[role] = await User.countDocuments({
        role,
        isDeleted: false,
        suspended: false
      });
    }

    /* ---------- TASKS ---------- */
    const totalTasks = await Task.countDocuments({ isDeleted: false });

    const allTasks = await Task.find({ isDeleted: false });

    const tasksByType = {
      poster: await Task.countDocuments({
        type: TASK_TYPES.POSTER,
        isDeleted: false
      }),
      reel: await Task.countDocuments({
        type: TASK_TYPES.REEL,
        isDeleted: false
      })
    };

    const completedCount = allTasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length;

    const tasksByStatus = {
      pending: totalTasks - completedCount,
      completed: completedCount
    };

    res.json({
      clients: {
        total: clientCount
      },
      users: {
        total: totalUsers,
        activeByRole: usersByRole
      },
      tasks: {
        total: totalTasks,
        byType: tasksByType,
        byStatus: tasksByStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   2. DOWNLOAD DASHBOARD REPORT
   ===================================================== */
exports.downloadReport = async (req, res, next) => {
  try {
    const { 
      range = 'month',
      format = 'detailed',
      includeClients = 'true',
      includeUsers = 'true',
      includeTasks = 'true',
      includeMetrics = 'true',
      includeFooter = 'true'
    } = req.query;
    
    const dateFilter = getDateRange(range);

    const taskFilter = { isDeleted: false };
    if (dateFilter) taskFilter.createdAt = dateFilter;

    const clientFilter = { isDeleted: false };
    const userFilter = { isDeleted: false };

    /* ---------- COUNTS ---------- */
    const clientCount = await Client.countDocuments(clientFilter);
    const totalUsers = await User.countDocuments(userFilter);

    const usersByRole = {};
    for (const role of Object.values(ROLES)) {
      usersByRole[role] = await User.countDocuments({
        role,
        isDeleted: false,
        suspended: false
      });
    }

    const totalTasks = await Task.countDocuments(taskFilter);

    const tasksByType = {
      poster: await Task.countDocuments({
        ...taskFilter,
        type: TASK_TYPES.POSTER
      }),
      reel: await Task.countDocuments({
        ...taskFilter,
        type: TASK_TYPES.REEL
      })
    };

    const reportStageBuckets = await Task.aggregate([
      { $match: { ...taskFilter, isDeleted: false } },
      { $group: { _id: '$currentStage', count: { $sum: 1 } } }
    ]);

    const tasksByStatus = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      rejected: 0
    };

    reportStageBuckets.forEach((bucket) => {
      if (bucket._id === INITIAL_TASK_STAGE) {
        tasksByStatus.pending += bucket.count;
      } else if (bucket._id === 'Done') {
        tasksByStatus.completed += bucket.count;
      } else {
        tasksByStatus['in-progress'] += bucket.count;
      }
    });

    /* ---------- PDF GENERATION ---------- */
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `VCRM Dashboard Report - ${range}`,
        Author: 'VCRM System',
        Subject: 'Dashboard Analytics Report'
      }
    });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=vcrm-report-${range}-${Date.now()}.pdf`
      );
      res.send(buffer);
    });

    // HEADER SECTION
    doc.rect(0, 0, doc.page.width, 120).fill('#026c8a');
    doc.fillColor('white').fontSize(28).font('Helvetica-Bold')
      .text('VCRM Dashboard Report', { align: 'center', y: 30 });
    
    doc.fontSize(12).font('Helvetica')
      .text(`Report Type: ${format === 'detailed' ? 'Detailed Analysis' : 'Summary Overview'}`, { align: 'center', y: 68 });
    
    doc.fontSize(10)
      .text(`Period: ${range.toUpperCase()} | Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { align: 'center', y: 88 });
    
    doc.moveDown(6);
    doc.fillColor('#000000');

    // SUMMARY BOX
    const summaryY = doc.y;
    doc.rect(50, summaryY, doc.page.width - 100, 80).fillAndStroke('#f0f9ff', '#026c8a');
    doc.fillColor('#026c8a').fontSize(16).font('Helvetica-Bold')
      .text('Quick Summary', 60, summaryY + 15);
    
    doc.fillColor('#000000').fontSize(11).font('Helvetica')
      .text(`Clients: ${clientCount}  |  Team: ${totalUsers}  |  Tasks: ${totalTasks}  |  Completed: ${tasksByStatus.completed || 0}`, 
        60, summaryY + 45, { width: doc.page.width - 120, align: 'center' });
    
    doc.moveDown(4);

    // CLIENTS SECTION
    if (includeClients === 'true') {
      addSection(doc, 'Clients Overview', '#3b82f6');
      doc.font('Helvetica').fontSize(11);
      
      if (format === 'detailed') {
        doc.text(`Total Active Clients: ${clientCount}`, { indent: 20 });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#666666')
          .text('Active clients represent organizations currently using the VCRM platform.', { indent: 20 });
      } else {
        doc.text(`Active Clients: ${clientCount}`, { indent: 20 });
      }
      doc.fillColor('#000000');
      doc.moveDown(1.2);
    }

    // USERS SECTION
    if (includeUsers === 'true') {
      addSection(doc, 'Team Members', '#10b981');
      doc.font('Helvetica').fontSize(11);
      doc.text(`Total Users: ${totalUsers}`, { indent: 20 }).moveDown(0.5);
      
      if (format === 'detailed') {
        doc.fontSize(10).fillColor('#026c8a').font('Helvetica-Bold')
          .text('Team Breakdown by Role:', { indent: 20 }).moveDown(0.3);
        doc.fillColor('#000000').font('Helvetica');
        
        Object.entries(usersByRole).forEach(([role, count]) => {
          if (count > 0) {
            doc.fontSize(10).text(`   ${role}:`, { continued: true, indent: 30 })
              .fillColor('#666666').text(` ${count} member${count !== 1 ? 's' : ''}`, { indent: 0 });
            doc.fillColor('#000000');
          }
        });
      } else {
        const topRoles = Object.entries(usersByRole)
          .filter(([_, count]) => count > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        doc.fontSize(10).text('Top Roles: ' + topRoles.map(([role, count]) => `${role} (${count})`).join(', '), { indent: 20 });
      }
      doc.moveDown(1.2);
    }

    // TASKS SECTION
    if (includeTasks === 'true') {
      addSection(doc, 'Task Statistics', '#f59e0b');
      doc.font('Helvetica').fontSize(11);
      doc.text(`Total Tasks: ${totalTasks}`, { indent: 20 }).moveDown(0.5);
      
      if (format === 'detailed') {
        doc.fontSize(10).fillColor('#026c8a').font('Helvetica-Bold')
          .text('Content Type Distribution:', { indent: 20 }).moveDown(0.3);
        doc.fillColor('#000000').font('Helvetica');
        doc.fontSize(10).text(`   Poster Tasks: ${tasksByType.poster}`, { indent: 30 });
        doc.fontSize(10).text(`   Reel Tasks: ${tasksByType.reel}`, { indent: 30 });
        
        const posterPercent = totalTasks ? Math.round((tasksByType.poster / totalTasks) * 100) : 0;
        const reelPercent = totalTasks ? Math.round((tasksByType.reel / totalTasks) * 100) : 0;
        doc.fontSize(9).fillColor('#666666')
          .text(`   (Poster: ${posterPercent}%, Reel: ${reelPercent}%)`, { indent: 30 });
        doc.fillColor('#000000');
      } else {
        doc.fontSize(10).text(`Poster: ${tasksByType.poster} | Reel: ${tasksByType.reel}`, { indent: 20 });
      }
      doc.moveDown(1.2);
    }

    // METRICS SECTION
    if (includeMetrics === 'true') {
      addSection(doc, 'Performance Metrics', '#22c55e');
      doc.font('Helvetica').fontSize(11);
      
      if (format === 'detailed') {
        doc.fontSize(10).fillColor('#026c8a').font('Helvetica-Bold')
          .text('Task Status Breakdown:', { indent: 20 }).moveDown(0.3);
        doc.fillColor('#000000').font('Helvetica');
        
        Object.entries(tasksByStatus).forEach(([status, count]) => {
          const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
          const percent = totalTasks ? Math.round((count / totalTasks) * 100) : 0;
          
          doc.fontSize(10).text(`   ${statusLabel}:`, { continued: true, indent: 30 })
            .fillColor('#666666').text(` ${count} (${percent}%)`, { indent: 0 });
          doc.fillColor('#000000');
        });
        
        // Performance Insights
        const completionRate = totalTasks ? Math.round((tasksByStatus.completed / totalTasks) * 100) : 0;
        const inProgressRate = totalTasks ? Math.round((tasksByStatus['in-progress'] / totalTasks) * 100) : 0;
        
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#026c8a').font('Helvetica-Bold')
          .text('Key Insights:', { indent: 20 }).moveDown(0.2);
        doc.fillColor('#000000').font('Helvetica').fontSize(9);
        doc.text(`   Completion Rate: ${completionRate}%`, { indent: 30 });
        doc.text(`   Active Work: ${inProgressRate}%`, { indent: 30 });
      } else {
        doc.fontSize(10).text(`Pending: ${tasksByStatus.pending || 0} | In Progress: ${tasksByStatus['in-progress'] || 0}`, { indent: 20 });
        doc.fontSize(10).text(`Completed: ${tasksByStatus.completed || 0} | Rejected: ${tasksByStatus.rejected || 0}`, { indent: 20 });
      }
      doc.moveDown(1.2);
    }

    // FOOTER
    if (includeFooter === 'true') {
      const footerY = doc.page.height - 80;
      doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke('#cccccc');
      doc.fontSize(9).fillColor('#666666').font('Helvetica')
        .text('This is an auto-generated report from the VCRM Dashboard System', 50, footerY + 10, { align: 'center' });
      doc.fontSize(8)
        .text(`Report ID: ${Date.now()} | Confidential & Proprietary`, 50, footerY + 25, { align: 'center' });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};

// Helper function to add section headers
function addSection(doc, title, color) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor(color).text(title);
  doc.moveTo(50, doc.y + 5).lineTo(doc.page.width - 50, doc.y + 5).stroke(color);
  doc.moveDown(0.5);
  doc.fillColor('#000000');
}

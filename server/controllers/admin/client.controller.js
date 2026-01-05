const Client = require('../../models/client');
const Task = require('../../models/task');

/* =====================================================
   1. CREATE CLIENT
   ===================================================== */
exports.createClient = async (req, res, next) => {
  try {
    const { name, companyName, priority } = req.body;
    const client = await Client.create({ name, companyName, priority });
    res.status(201).json({ client });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   2. UPDATE CLIENT
   ===================================================== */
exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndUpdate(id, req.body, { new: true });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ client });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   3. SOFT DELETE CLIENT
   ===================================================== */
exports.softDeleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.isDeleted = true;
    client.deletedAt = new Date();
    await client.save();

    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   4. VIEW DELETED CLIENTS
   ===================================================== */
exports.viewDeletedClients = async (req, res, next) => {
  try {
    const { q, priority } = req.query;

    const filter = { isDeleted: true };

    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { companyName: new RegExp(q, 'i') }
      ];
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.json({ clients });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   5. CLIENT PROFILE (STATS + CALENDAR)
   ===================================================== */
exports.viewClientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const taskFilter = { clientId: client._id, isDeleted: false };

    const tasks = await Task.find(taskFilter);

    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.stageHistory.some(h => h.stage === 'Posted')).length,
      pending: tasks.filter(t => !t.stageHistory.some(h => h.stage === 'Posted')).length
    };

    res.json({
      client,
      calendar: tasks.map(t => ({
        id: t._id,
        title: t.title,
        date: t.scheduledDate,
        type: t.type,
        isCompleted: t.stageHistory.some(h => h.stage === 'Posted')
      })),
      stats
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   6. LIST ACTIVE CLIENTS
   ===================================================== */
exports.listClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, q, priority } = req.query;

    const filter = { isDeleted: false };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { companyName: new RegExp(q, 'i') }
      ];
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Client.countDocuments(filter);

    res.json({
      clients,
      meta: { page: Number(page), limit: Number(limit), total }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   7. RESTORE CLIENT
   ===================================================== */
exports.restoreClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (!client.isDeleted) {
      return res.status(400).json({ message: 'Client already active' });
    }

    client.isDeleted = false;
    client.deletedAt = null;
    await client.save();

    res.json({ message: 'Client restored successfully', client });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   8. GET CLIENT TASKS
   ===================================================== */
exports.getClientTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const taskFilter = { clientId: id, isDeleted: false };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      taskFilter.scheduledDate = { $gte: startDate, $lte: endDate };
    }

    const tasks = await Task.find(taskFilter).sort({ scheduledDate: -1 });

    res.json({ 
      calendar: tasks.map(t => ({
        id: t._id,
        title: t.title,
        date: t.scheduledDate,
        type: t.type,
        currentStage: t.currentStage
      })),
      client: { id: client._id, name: client.name, companyName: client.companyName } 
    });
  } catch (err) {
    next(err);
  }
};

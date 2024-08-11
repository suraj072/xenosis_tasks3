const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user.id });
    req.io.emit("taskCreated", task);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Unable to create task" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    req.io.emit("taskUpdated", task);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Unable to update task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    req.io.emit("taskDeleted", req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Unable to delete task" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: "Unable to fetch tasks" });
  }
};

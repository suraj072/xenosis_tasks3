import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import SocketContext from "../context/SocketContext";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((response) => setTasks(response.data))
      .catch((error) => console.error(error));

    socket.on("taskCreated", (task) => {
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on("taskDeleted", (deletedTaskId) => {
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== deletedTaskId)
      );
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [socket]);

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  );
};

export default TaskList;

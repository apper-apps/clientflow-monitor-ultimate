// Since the task table in the database doesn't have all the time tracking fields from mock data,
// we'll use a hybrid approach: store basic task data in database and time tracking in memory
import tasksData from "@/services/mockData/tasks.json";

let timeTrackingData = {};
let nextTimeLogId = 100;

// Initialize time tracking data from mock data
tasksData.forEach(task => {
  if (task.timeTracking) {
    timeTrackingData[task.Id] = task.timeTracking;
  }
});

export const getAllTasks = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "projectId" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "totalTime" } }
      ],
      orderBy: [
        { fieldName: "dueDate", sorttype: "ASC" }
      ]
    };
    
    const response = await apperClient.fetchRecords("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Merge with time tracking data
    const tasks = (response.data || []).map(task => ({
      ...task,
      timeTracking: timeTrackingData[task.Id] || {
        totalTime: 0,
        activeTimer: null,
        timeLogs: []
      }
    }));
    
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "projectId" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "totalTime" } }
      ]
    };
    
    const response = await apperClient.getRecordById("task", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Merge with time tracking data
    const task = {
      ...response.data,
      timeTracking: timeTrackingData[response.data.Id] || {
        totalTime: 0,
        activeTimer: null,
        timeLogs: []
      }
    };
    
    return task;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Name: taskData.Name || taskData.title,
        projectId: parseInt(taskData.projectId),
        title: taskData.title,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        totalTime: taskData.totalTime || 0
      }]
    };
    
    const response = await apperClient.createRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const successfulRecords = response.results.filter(result => result.success);
      const newTask = successfulRecords[0]?.data;
      
      // Initialize time tracking
      if (newTask) {
        timeTrackingData[newTask.Id] = {
          totalTime: 0,
          activeTimer: null,
          timeLogs: []
        };
      }
      
      return newTask;
    }
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: taskData.Name || taskData.title,
        projectId: parseInt(taskData.projectId),
        title: taskData.title,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        totalTime: taskData.totalTime || 0
      }]
    };
    
    const response = await apperClient.updateRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const successfulRecords = response.results.filter(result => result.success);
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Id: parseInt(id),
        status: status
      }]
    };
    
    const response = await apperClient.updateRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const successfulRecords = response.results.filter(result => result.success);
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      // Remove time tracking data
      delete timeTrackingData[parseInt(id)];
      
      return true;
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Time tracking functions remain in memory for now
export const startTaskTimer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskId = parseInt(id);
  
  if (!timeTrackingData[taskId]) {
    timeTrackingData[taskId] = {
      totalTime: 0,
      activeTimer: null,
      timeLogs: []
    };
  }

  if (timeTrackingData[taskId].activeTimer) {
    throw new Error("Timer already running for this task");
  }

  const now = new Date().toISOString();
  timeTrackingData[taskId].activeTimer = {
    Id: taskId,
    startTime: now
  };

  return { ...timeTrackingData[taskId].activeTimer };
};

export const stopTaskTimer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskId = parseInt(id);

  if (!timeTrackingData[taskId]?.activeTimer) {
    throw new Error("No active timer for this task");
  }

  const now = new Date().toISOString();
  const startTime = new Date(timeTrackingData[taskId].activeTimer.startTime);
  const endTime = new Date(now);
  const duration = endTime.getTime() - startTime.getTime();

  const timeLog = {
    Id: nextTimeLogId++,
    startTime: timeTrackingData[taskId].activeTimer.startTime,
    endTime: now,
    duration: duration,
    date: startTime.toISOString().split('T')[0]
  };

  timeTrackingData[taskId].timeLogs.push(timeLog);
  timeTrackingData[taskId].totalTime += duration;
  timeTrackingData[taskId].activeTimer = null;

  return { ...timeLog };
};

export const getTaskTimeLogs = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const taskId = parseInt(id);
  return timeTrackingData[taskId]?.timeLogs || [];
};
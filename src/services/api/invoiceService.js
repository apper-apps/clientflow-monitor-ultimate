export const getAllInvoices = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } }
      ],
      orderBy: [
        { fieldName: "dueDate", sorttype: "DESC" }
      ]
    };
    
    const response = await apperClient.fetchRecords("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } }
      ]
    };
    
    const response = await apperClient.getRecordById("app_invoice", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    // Validate required fields
    if (!invoiceData.projectId) {
      throw new Error("Project ID is required");
    }
    if (!invoiceData.amount || invoiceData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (!invoiceData.dueDate) {
      throw new Error("Due date is required");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Name: `Invoice-${Date.now()}`,
        clientId: parseInt(invoiceData.clientId),
        projectId: parseInt(invoiceData.projectId),
        amount: parseFloat(invoiceData.amount),
        status: invoiceData.status || 'draft',
        dueDate: invoiceData.dueDate,
        paymentDate: invoiceData.paymentDate || null
      }]
    };
    
    const response = await apperClient.createRecord("app_invoice", params);
    
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
      return successfulRecords[0]?.data;
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }

    // Validate data if provided
    if (invoiceData.amount !== undefined && invoiceData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const updateData = {
      Id: parsedId
    };

    if (invoiceData.clientId) updateData.clientId = parseInt(invoiceData.clientId);
    if (invoiceData.projectId) updateData.projectId = parseInt(invoiceData.projectId);
    if (invoiceData.amount !== undefined) updateData.amount = parseFloat(invoiceData.amount);
    if (invoiceData.status) updateData.status = invoiceData.status;
    if (invoiceData.dueDate) updateData.dueDate = invoiceData.dueDate;
    if (invoiceData.paymentDate) updateData.paymentDate = invoiceData.paymentDate;

    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
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
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const markInvoiceAsSent = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Id: parsedId,
        status: "sent"
      }]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
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
    console.error("Error marking invoice as sent:", error);
    throw error;
  }
};

export const markInvoiceAsPaid = async (id, paymentDate) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }

    if (!paymentDate) {
      throw new Error("Payment date is required");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Id: parsedId,
        status: "paid",
        paymentDate: new Date(paymentDate).toISOString()
      }]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
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
    console.error("Error marking invoice as paid:", error);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parsedId]
    };
    
    const response = await apperClient.deleteRecord("app_invoice", params);
    
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
      
      return true;
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};
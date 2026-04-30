const Customer = require('../models/customerModel');
const MissionCardCustomer = require('../models/missionCardCustomerModel');
const MissionCard = require('../models/missionModel');

const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const updatedCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const [rowsAffected] = await Customer.update(req.body, {
      where: { customer_id: id },
    });

    if (rowsAffected > 0) {
      const updatedCustomerData = await Customer.findByPk(id);
      res.json({
        message: 'Customer updated successfully.',
        customer: updatedCustomerData,
      });
    } else {
      res.status(404).json({ message: 'Customer not found.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getCustomerByMissionId = async (req, res) => {
  const { id } = req.params;
  try {
    const mission = await MissionCard.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customers',
          through: {
            model: MissionCardCustomer,
            attributes: [],
          },
        },
      ],
    });
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    const customers = mission.customers;

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer fetched successfully',
      customers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getMissionByCustomerId = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: MissionCard,
          as: 'missionCards',
          through: {
            model: MissionCardCustomer,
            attributes: [],
          },
        },
      ],
    });
    if (!customer) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    const missions = customer.missionCards;

    res.status(200).json({
      success: true,
      message: 'Missions fetched successfully',
      customer: customer,
      missions: missions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteCustomer = await Customer.destroy({
      where: { customer_id: id },
    });

    if (deleteCustomer) {
      res.json({ message: 'Customer deleted successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal service error' });
  }
};

module.exports = {
  createCustomer,
  updatedCustomer,
  deleteCustomer,
  getCustomerByMissionId,
  getMissionByCustomerId,
  getCustomers,
};

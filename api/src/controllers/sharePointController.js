const MissionCard = require('../models/missionModel');
const SharePoint = require('../models/sharePointModel');

const createSharepointLink = async (req, res) => {
  try {
    const link = await SharePoint.create(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getSharepointLinkById = async (req, res) => {
  const { id } = req.params;
  try {
    const link = await SharePoint.findAll({
      where: { doc_mission_id: id },
      include: [
        {
          model: MissionCard,
          as: 'missionCard_links',
        },
      ],
    });

    if (!link) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteSharepointLink = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteLink = await SharePoint.destroy({
      where: { id },
    });

    if (deleteLink === 0) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
const getSharepointLink = async (req, res) => {
  try {
    const link = await SharePoint.findAll();
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal service error' });
  }
};
const updateSharepointLink = async (req, res) => {
  const { id } = req.params;

  try {
    const [updatedRows] = await SharePoint.update(req.body, {
      where: { id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'SharePoint link not found or no changes made.' });
    }

    const updatedLink = await SharePoint.findByPk(id);
    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating SharePoint link:', error);
    res.status(500).json({ error: error.message });
  }
};
const assignLinkToMission = async (req, res) => {
  const { id } = req.params; // MissionCard ID
  const { links } = req.body; // Array of SharePoint links

  try {
    const mission = await MissionCard.findByPk(id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Filter out empty or invalid links
    // const validLinks = links.filter(link => typeof link === 'string' && link.trim() !== '');

    //  if (validLinks.length === 0) {
    //  return res.status(400).json({ message: "No valid SharePoint links provided" });
    //}

    // Create each link and associate with the mission in sharepoint table.
    const createdLinks = await Promise.all(
      links.map((link) =>
        SharePoint.create({
          url_link: link,
          doc_mission_id: mission.id,
        })
      )
    );

    res.status(200).json({
      message: 'SharePoint links successfully assigned to mission',
      links: createdLinks,
    });
  } catch (error) {
    console.error('Error assigning SharePoint links:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createSharepointLink,
  deleteSharepointLink,
  getSharepointLinkById,
  getSharepointLink,
  assignLinkToMission,
  updateSharepointLink,
};

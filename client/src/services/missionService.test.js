import { missionService } from './missionService';
import api from '../axios';

jest.mock('../axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('missionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAll should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await missionService.getAll();
    expect(api.get).toHaveBeenCalledWith('/mission/getAll');
  });

  it('getById should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await missionService.getById(1);
    expect(api.get).toHaveBeenCalledWith('/mission/getMission/1');
  });

  it('getByProjectId should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await missionService.getByProjectId(1);
    expect(api.get).toHaveBeenCalledWith('/mission/getMissionByProjId/1');
  });

  it('create should call api.post with the correct URL and data', async () => {
    const newMission = { mission_title: 'Test' };
    api.post.mockResolvedValueOnce({ data: newMission });
    await missionService.create(newMission);
    expect(api.post).toHaveBeenCalledWith('/mission/create', newMission);
  });

  it('update should call api.put with the correct URL and data', async () => {
    const updatedMission = { mission_title: 'Test Updated' };
    api.put.mockResolvedValueOnce({ data: updatedMission });
    await missionService.update(1, updatedMission);
    expect(api.put).toHaveBeenCalledWith('/mission/update/1', updatedMission);
  });

  it('delete should call api.delete with the correct URL', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await missionService.delete(1);
    expect(api.delete).toHaveBeenCalledWith('/mission/delete/1');
  });


});

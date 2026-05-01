import { projectService } from './projectService';
import api from '../axios';

jest.mock('../axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('projectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAll should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await projectService.getAll();
    expect(api.get).toHaveBeenCalledWith('/project/getProj');
  });

  it('getLatest should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await projectService.getLatest();
    expect(api.get).toHaveBeenCalledWith('/project/getLatestProj');
  });

  it('getById should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await projectService.getById(123);
    expect(api.get).toHaveBeenCalledWith('/project/getProj/123');
  });

  it('create should call api.post with the correct URL and data', async () => {
    const newProject = { project_title: 'Test' };
    api.post.mockResolvedValueOnce({ data: newProject });
    await projectService.create(newProject);
    expect(api.post).toHaveBeenCalledWith('/project/createProj', newProject);
  });

  it('update should call api.put with the correct URL and data', async () => {
    const updatedProject = { project_title: 'Test Updated' };
    api.put.mockResolvedValueOnce({ data: updatedProject });
    await projectService.update(123, updatedProject);
    expect(api.put).toHaveBeenCalledWith('/project/updateProj/123', updatedProject);
  });

  it('delete should call api.delete with the correct URL', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await projectService.delete(123);
    expect(api.delete).toHaveBeenCalledWith('/project/deleteProj/123');
  });
});

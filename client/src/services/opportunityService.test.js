import { opportunityService } from './opportunityService';
import api from '../axios';

jest.mock('../axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('opportunityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAll should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await opportunityService.getAll();
    expect(api.get).toHaveBeenCalledWith('/oppurtunities/getOpp');
  });

  it('getLatest should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await opportunityService.getLatest();
    expect(api.get).toHaveBeenCalledWith('/oppurtunities/getLatestOpp');
  });

  it('getById should call api.get with the correct URL', async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    await opportunityService.getById(1);
    expect(api.get).toHaveBeenCalledWith('/oppurtunities/getOpp/1');
  });

  it('create should call api.post with the correct URL and data', async () => {
    const newOpp = { title: 'Test' };
    api.post.mockResolvedValueOnce({ data: newOpp });
    await opportunityService.create(newOpp);
    expect(api.post).toHaveBeenCalledWith('/oppurtunities/createOpp', newOpp);
  });

  it('update should call api.put with the correct URL and data', async () => {
    const updatedOpp = { title: 'Test Updated' };
    api.put.mockResolvedValueOnce({ data: updatedOpp });
    await opportunityService.update(1, updatedOpp);
    expect(api.put).toHaveBeenCalledWith('/oppurtunities/updateOpp/1', updatedOpp);
  });

  it('delete should call api.delete with the correct URL', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await opportunityService.delete(1);
    expect(api.delete).toHaveBeenCalledWith('/oppurtunities/deleteOpp/1');
  });
});

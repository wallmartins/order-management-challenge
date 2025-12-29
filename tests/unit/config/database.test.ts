import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '@/config/database';

vi.mock('mongoose');

describe('Database Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connectDatabase', () => {
    it('should connect to MongoDB successfully', async () => {
      vi.mocked(mongoose.connect).mockResolvedValue(mongoose as any);

      await connectDatabase();

      expect(mongoose.connect).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('MongoDB connected successfully');
    });

    it('should handle connection errors and exit process', async () => {
      const error = new Error('Connection failed');
      vi.mocked(mongoose.connect).mockRejectedValue(error);

      await connectDatabase();

      expect(console.error).toHaveBeenCalledWith('MongoDB connection error:', error);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('disconnectDatabase', () => {
    it('should disconnect from MongoDB successfully', async () => {
      vi.mocked(mongoose.disconnect).mockResolvedValue();

      await disconnectDatabase();

      expect(mongoose.disconnect).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('MongoDB disconnected successfully');
    });

    it('should handle disconnection errors', async () => {
      const error = new Error('Disconnection failed');
      vi.mocked(mongoose.disconnect).mockRejectedValue(error);

      await disconnectDatabase();

      expect(console.error).toHaveBeenCalledWith('MongoDB disconnection error:', error);
    });
  });
});

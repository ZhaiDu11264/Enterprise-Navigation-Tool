import api from './api';
import { FeedbackEntry } from '../types';

export interface FeedbackPayload {
  type: 'bug' | 'feature' | 'ui' | 'data' | 'other';
  message: string;
}

class FeedbackService {
  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackEntry> {
    const response = await api.post('/feedback', payload);
    return (response.data as any).data.feedback as FeedbackEntry;
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;

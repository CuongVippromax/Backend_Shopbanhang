import { apiGet } from './client';

export const getFaqs = () => apiGet('/faqs');

export const getFaqCategories = () => apiGet('/faqs/categories');

export const getFaqsPublic = () => apiGet('/faqs');

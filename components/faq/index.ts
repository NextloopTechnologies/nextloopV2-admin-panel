import { faqService } from '@/app/api/services/faqService';
import { IFaq } from '@/types/blog';

export const faqApi = {
    //  Get FAQs for a blog
    getByBlogId: async (blogId: number): Promise<IFaq[]> => {
        try {
            return await faqService.getByBlogId(blogId);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            throw error;
        }
    },

    //  Create new FAQ
    create: async (faqData: {
        blog_id: number;
        question: string;
        answer: string;
        display_order?: number;
    }): Promise<IFaq> => {
        try {
            return await faqService.create(faqData);
        } catch (error) {
            console.error('Error creating FAQ:', error);
            throw error;
        }
    },

    // Update FAQ
    update: async (id: number, updates: {
        question?: string;
        answer?: string;
        display_order?: number;
    }): Promise<IFaq> => {
        try {
            return await faqService.update(id, updates);
        } catch (error) {
            console.error('Error updating FAQ:', error);
            throw error;
        }
    },

    // Delete FAQ
    delete: async (id: number): Promise<void> => {
        try {
            await faqService.delete(id);
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            throw error;
        }
    },

    //  Delete all FAQs for a blog
    deleteByBlogId: async (blogId: number): Promise<void> => {
        try {
            await faqService.deleteByBlogId(blogId);
        } catch (error) {
            console.error('Error deleting FAQs:', error);
            throw error;
        }
    },

    // Reorder FAQs
    reorder: async (faqs: { id: number; display_order: number }[]): Promise<void> => {
        try {
            await faqService.reorder(faqs);
        } catch (error) {
            console.error('Error reordering FAQs:', error);
            throw error;
        }
    },

    // Get FAQ count
    getCount: async (blogId: number): Promise<number> => {
        try {
            return await faqService.getCount(blogId);
        } catch (error) {
            console.error('Error getting FAQ count:', error);
            return 0;
        }
    },

    // Check if blog has FAQs
    hasFaqs: async (blogId: number): Promise<boolean> => {
        try {
            return await faqService.hasFaqs(blogId);
        } catch (error) {
            console.error('Error checking FAQs:', error);
            return false;
        }
    }
};
import { supabase } from "@/lib/supabase/query";
import { IFaq } from '@/types/blog';

export const faqService = {
    //  Get all FAQs for a blog
    getByBlogId: async (blogId: number): Promise<IFaq[]> => {
        try {
            const { data, error } = await supabase
                .from("faqs")
                .select('*')
                .eq('blog_id', blogId)
                .order('display_order', { ascending: true });

            if (error) {
                console.error("SUPABASE_FAQ_GET_ERROR:", error);
                throw new Error(error.message);
            }

            return data || [];
        } catch (error) {
            console.error('Error in getByBlogId:', error);
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
            const { data, error } = await supabase
                .from('faqs')
                .insert([{
                    blog_id: faqData.blog_id,
                    question: faqData.question,
                    answer: faqData.answer,
                    display_order: faqData.display_order ?? 0,
                }])
                .select()
                .single();

            if (error) {
                console.error("SUPABASE_FAQ_CREATE_ERROR:", error);
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    },

    //  Update FAQ
    update: async (id: number, updates: {
        question?: string;
        answer?: string;
        display_order?: number;
    }): Promise<IFaq> => {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("SUPABASE_FAQ_UPDATE_ERROR:", error);
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    },

    //  Delete FAQ
    delete: async (id: number): Promise<{ success: boolean; msgText?: string; status?: number }> => {
        try {
            const { error } = await supabase
                .from('faqs')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("SUPABASE_FAQ_DELETE_ERROR:", error);
                return { success: false, msgText: error.message, status: 500 };
            }

            return { success: true, msgText: "Deleted!", status: 200 };
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    },

    // Delete all FAQs for a blog
    deleteByBlogId: async (blogId: number): Promise<{ success: boolean; msgText?: string; status?: number }> => {
        try {
            const { error } = await supabase
                .from('faqs')
                .delete()
                .eq('blog_id', blogId);

            if (error) {
                console.error("SUPABASE_FAQ_DELETE_BY_BLOG_ERROR:", error);
                return { success: false, msgText: error.message, status: 500 };
            }

            return { success: true, msgText: "All FAQs deleted!", status: 200 };
        } catch (error) {
            console.error('Error in deleteByBlogId:', error);
            throw error;
        }
    },

    // Reorder FAQs (bulk update)
    reorder: async (faqs: { id: number; display_order: number }[]): Promise<{ success: boolean; msgText?: string; status?: number }> => {
        try {
            for (const faq of faqs) {
                const { error } = await supabase
                    .from('faqs')
                    .update({ display_order: faq.display_order })
                    .eq('id', faq.id);

                if (error) {
                    console.error("SUPABASE_FAQ_REORDER_ERROR:", error);
                    return { success: false, msgText: error.message, status: 500 };
                }
            }

            return { success: true, msgText: "Reordered!", status: 200 };
        } catch (error) {
            console.error('Error in reorder:', error);
            throw error;
        }
    },

    // Get FAQ count for a blog
    getCount: async (blogId: number): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('faqs')
                .select('*', { count: 'exact', head: true })
                .eq('blog_id', blogId);

            if (error) {
                console.error("SUPABASE_FAQ_COUNT_ERROR:", error);
                throw new Error(error.message);
            }

            return count || 0;
        } catch (error) {
            console.error('Error in getCount:', error);
            throw error;
        }
    },

    // Check if blog has FAQs
    hasFaqs: async (blogId: number): Promise<boolean> => {
        try {
            const count = await faqService.getCount(blogId);
            return count > 0;
        } catch (error) {
            console.error('Error in hasFaqs:', error);
            return false;
        }
    }
};
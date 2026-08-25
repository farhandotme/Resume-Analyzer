import { supabase } from '../utils/supabase';

export async function uploadResume(file: File): Promise<string> {
    const filePath = `resumes/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

    const { data, error } = await supabase.storage.from('resume').upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false,
    });

    if (error) {
        throw new Error(`Failed to upload resume: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from('resume').getPublicUrl(data.path);

    if (!urlData.publicUrl) {
        throw new Error('Failed to get resume URL');
    }

    return urlData.publicUrl;
}
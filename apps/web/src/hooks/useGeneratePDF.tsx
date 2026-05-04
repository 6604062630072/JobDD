import React from 'react';
import { pdf } from '@react-pdf/renderer';

export const useGeneratePDF = () => {
    const generate = async (userFullData: any) => {
        try {
            const { ResumeTemplate } = await import('../components/ResumeTemplate');

            const blob = await pdf(
                <ResumeTemplate key={Date.now()} data={{ ...userFullData }} />
            ).toBlob();

            const fileName = `Resume_${userFullData.firstName || 'User'}_${Date.now()}.pdf`;
            return new File([blob], fileName, { type: 'application/pdf' });

        } catch (error) {
            console.error("Generate PDF Error:", error);
            throw error;
        }
    };

    return { generate };
};
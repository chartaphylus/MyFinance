import { useState, useEffect } from 'react';

export interface Holiday {
    tanggal: string;
    tanggal_display: string;
    keterangan: string;
    is_cuti: boolean;
}

export function useHolidays(year: number) {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHolidays() {
            try {
                setLoading(true);
                // Using a public API for Indonesian holidays
                // Source: https://github.com/kalenderjawa/dayoffapi
                const response = await fetch(`https://dayoffapi.vercel.app/api?year=${year}&country=id`);

                if (!response.ok) {
                    throw new Error('Failed to fetch holidays');
                }

                const data = await response.json();
                setHolidays(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching holidays:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchHolidays();
    }, [year]);

    return { holidays, loading, error };
}

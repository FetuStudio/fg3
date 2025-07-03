import { useEffect, useState } from 'react';
import '../styles/globals.css'
import { supabase } from '../utils/supabaseClient';

export default function MyApp({ Component, pageProps }) {
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    async function fetchAlert() {
      if (!supabase) {
        console.error('Supabase client is undefined');
        return;
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching alert:', error);
      } else {
        setAlertMessage(data);
      }
    }

    fetchAlert();
  }, []);

  return (
    <>
      {alertMessage && <div>{alertMessage.message}</div>}
      <Component {...pageProps} />
    </>
  );
}

interface Config {
  googleClientId: string;
  googleClientSecret: string;
}

let configCache: Config | null = null;

export const getConfig = async (): Promise<Config> => {
  if (configCache) {
    console.log('Using cached config');
    return configCache;
  }

  try {
    console.log('Fetching config from server...');
    const response = await fetch('https://weaveboxserver-production.up.railway.app/api/config');
    console.log('Config response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    
    const config = await response.json();
    // console.log('Received config:', config);
    
    configCache = config as Config;
    return configCache;
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw error;
  }
}; 
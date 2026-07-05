import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes';
import { AntdGlobalHelper } from './utils/antd';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        const status = error.response?.status;
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Ant Design 5.x Theme Tokens
 * Design System based on Ant Design Pro standards
 */
const themeConfig = {
  token: {
    // Colors
    colorPrimary: '#6366f1', // Indigo 500
    colorSuccess: '#10b981', // Emerald 500
    colorWarning: '#f59e0b', // Amber 500
    colorError: '#ef4444', // Red 500
    colorInfo: '#6366f1',

    // Typography
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,

    // Border
    borderRadius: 12, // More premium, rounded UI
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // Spacing
    marginXS: 4,
    marginSM: 8,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
  },
  components: {
    Layout: {
      siderBg: '#0f172a', // Slate 900
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
    },
    Menu: {
      itemBg: '#0f172a',
      itemSelectedBg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      itemSelectedColor: '#ffffff',
      itemColor: '#94a3b8',
      itemHoverColor: '#ffffff',
      itemHoverBg: '#1e293b',
      itemBorderRadius: 8,
      subMenuBg: '#0f172a',
    },
    Table: {
      headerBg: '#f8fafc',
      borderColor: '#f1f5f9',
    },
    Card: {
      borderRadiusLG: 16,
    },
    Button: {
      borderRadius: 10,
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <AntApp>
          <AntdGlobalHelper />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;

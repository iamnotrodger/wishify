import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: () => {
    const apiUrl = import.meta.env.WXT_API_URL;

    return {
      name: 'Wishify',
      permissions: ['activeTab', 'scripting'],
      // Lets the popup send the web app's auth cookies with its requests.
      host_permissions: apiUrl ? [`${new URL(apiUrl).origin}/*`] : [],
    };
  },
});

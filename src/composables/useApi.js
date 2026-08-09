import { useAuth0 } from "@auth0/auth0-vue";
import { useI18n } from "vue-i18n";
import { useSnackbar } from "@/composables/useSnackbar";

/**
 * Authenticated API wrapper with centralised error handling.
 * All user-facing error messages are translated via vue-i18n.
 */
export function useApi() {
  const { getAccessTokenSilently, isAuthenticated, logout } = useAuth0();
  const { showMessage } = useSnackbar();
  const { t } = useI18n();

  /**
   * @param {string} url - endpoint path (appended to VUE_APP_SERVER_DOMAIN/api/)
   * @param {object} options - fetch options (method, headers, body, …)
   * @param {boolean} requireAuth - whether to inject the Auth0 bearer token (default: true)
   */
  const apiRequest = async (url, options = {}, requireAuth = true) => {
    try {
      const isFormData = options.body instanceof FormData;

      const headers = { ...(options.headers || {}) };

      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      if (requireAuth && isAuthenticated.value) {
        const token = await getAccessTokenSilently({
          audience: "https://frc-awards.api",
          scope: "read:events write:events",
        });
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.VUE_APP_SERVER_DOMAIN}/api/${url}`,
        { ...options, headers }
      );

      if (response.status === 401) {
        showMessage(t("api.sessionExpired"), "error");
        logout({ logoutParams: { returnTo: window.location.origin } });
        throw new Error(t("api.unauthorized"));
      }

      if (!response.ok) {
        let message = t("api.httpError", {
          status: response.status,
          statusText: response.statusText,
        });
        try {
          const errorData = await response.json();
          if (errorData?.message) message = errorData.message;
        } catch { /* ignore parse error */ }
        showMessage(message, "error");
        throw new Error(message);
      }

      try {
        return await response.json();
      } catch {
        return null;
      }
    } catch (err) {
      showMessage(t("api.communicationFailed", { message: err.message }), "error");
      throw err;
    }
  };

  return { apiRequest };
}

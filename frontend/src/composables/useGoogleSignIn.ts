import { onMounted } from "vue";

declare global {
    interface Window {
        google?: any;
    }
}

export function useGoogleSignIn(buttonId: string, onCredential: (idToken: string) => void) {
    function renderButton() {
        if (!window.google) {
            console.warn("El script de Google aún no cargó; reintentar en breve");
            setTimeout(renderButton, 200);
            return;
        }

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => onCredential(response.credential),
        });

        const container = document.getElementById(buttonId);
        if (container) {
            window.google.accounts.id.renderButton(container, {
                theme: "outline",
                size: "large",
                width: 320,
            });
        }
    }

    onMounted(renderButton);
}
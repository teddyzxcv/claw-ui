import Dashboard from "@/components/Dashboard";
import type { UIStateData } from "@/lib/types";

const backendOrigin = (
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const defaultState = (): UIStateData => ({
  views: {
    main: {
      layout: {
        columns: [
          { id: "col_1", widget_ids: [] },
          { id: "col_2", widget_ids: [] },
        ],
      },
    },
  },
  widgets: {},
});

const getInitialState = async (): Promise<UIStateData> => {
  try {
    const response = await fetch(`${backendOrigin}/state`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return defaultState();
    }

    return (await response.json()) as UIStateData;
  } catch {
    return defaultState();
  }
};

export default async function HomePage() {
  const initialState = await getInitialState();

  return <Dashboard initialState={initialState} />;
}

export const isDesignPreview = process.env.SGF_DESIGN_PREVIEW === "1" && process.env.VERCEL_ENV !== "production";
export const cinematicDesign = process.env.SGF_CINEMATIC_HOME !== "0";

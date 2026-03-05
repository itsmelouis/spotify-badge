import { Hono } from "hono";
import type { Bindings } from "./types";
import banner from "./routes/banner";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.redirect("/banner.svg", 302));

app.route("/", banner);

export default app;

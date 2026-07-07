import type { CollectionEntry } from "astro:content";

export default (post: CollectionEntry<"blog">) => {
  return (
    <div
      style={{
        background: "#20242e",
        color: "#dde1e8",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#949aa8" }}>
        -- psousa.dev
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          maxHeight: "60%",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            fontSize: 68,
            fontWeight: "bold",
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          {post.data.title}
          <span
            style={{
              display: "flex",
              width: 30,
              height: 58,
              marginLeft: 18,
              background: "#ff8534",
            }}
          />
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #363c4a",
          paddingTop: "28px",
          fontSize: 30,
          color: "#949aa8",
        }}
      >
        <span>-- {post.data.author}</span>
        <span>{post.data.pubDatetime.toISOString().slice(0, 10)}</span>
      </div>
    </div>
  );
};

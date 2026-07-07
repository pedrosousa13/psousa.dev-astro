import { SITE } from "@config";

export default () => {
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
        psousa.dev=# select bio from author;
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "60%",
          overflow: "hidden",
        }}
      >
        <p style={{ fontSize: 76, fontWeight: "bold", margin: 0 }}>
          {SITE.title}
          <span
            style={{
              display: "flex",
              width: 32,
              height: 64,
              marginLeft: 18,
              background: "#ff8534",
            }}
          />
        </p>
        <p
          style={{
            fontSize: 32,
            color: "#949aa8",
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          {SITE.desc}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #363c4a",
          paddingTop: "28px",
          fontSize: 30,
          color: "#949aa8",
        }}
      >
        <span>-- staff software engineer</span>
        <span>{new URL(SITE.website).hostname}</span>
      </div>
    </div>
  );
};

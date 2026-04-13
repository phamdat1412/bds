import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicSearchSuggestionsApi } from "../publicProjects.api";
import { useDebounce } from "../../../hooks/useDebounce";

type Props = {
  placeholder?: string;
};

export default function PublicSearchBox({
  placeholder = "Tìm dự án, căn hộ, tin tức...",
}: Props) {
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    projects: Array<{
      id: string;
      type: "project";
      name: string;
      slug: string;
      location: string;
      projectType: string | null;
    }>;
    properties: Array<{
      id: string;
      type: "property";
      code: string;
      title: string;
      price: string | null;
      areaGross: string | null;
      propertyType: string;
      project: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
    news: Array<{
      id: string;
      type: "news";
      title: string;
      slug: string;
      summary: string | null;
    }>;
  }>({
    projects: [],
    properties: [],
    news: [],
  });

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    async function loadSuggestions() {
      const q = debouncedKeyword.trim();

      if (!q) {
        setSuggestions({
          projects: [],
          properties: [],
          news: [],
        });
        return;
      }

      try {
        const result = await getPublicSearchSuggestionsApi(q);
        setSuggestions(result.data);
      } catch {
        setSuggestions({
          projects: [],
          properties: [],
          news: [],
        });
      }
    }

    loadSuggestions();
  }, [debouncedKeyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasSuggestions = useMemo(() => {
    return (
      suggestions.projects.length > 0 ||
      suggestions.properties.length > 0 ||
      suggestions.news.length > 0
    );
  }, [suggestions]);

  return (
    <div style={styles.wrap} ref={boxRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setOpen(true)}
        style={styles.input}
      />

      {open && keyword.trim() && hasSuggestions ? (
        <div style={styles.dropdown}>
          {suggestions.projects.length > 0 ? (
            <div style={styles.group}>
              <div style={styles.groupTitle}>Dự án</div>

              {suggestions.projects.map((item) => (
                <button
                  key={`project-${item.id}`}
                  type="button"
                  style={styles.item}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/projects/${item.slug}`);
                  }}
                >
                  <div style={styles.main}>{item.name}</div>
                  <div style={styles.sub}>
                    {item.location || item.projectType || "Dự án"}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {suggestions.properties.length > 0 ? (
            <div style={styles.group}>
              <div style={styles.groupTitle}>Căn hộ / Sản phẩm</div>

              {suggestions.properties.map((item) => (
                <button
                  key={`property-${item.id}`}
                  type="button"
                  style={styles.item}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/properties/${item.id}`);
                  }}
                >
                  <div style={styles.main}>
                    {item.code} - {item.title}
                  </div>
                  <div style={styles.sub}>
                    {item.project.name}
                    {item.areaGross ? ` • ${item.areaGross} m²` : ""}
                    {item.price
                      ? ` • ${Number(item.price).toLocaleString()} VND`
                      : ""}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {suggestions.news.length > 0 ? (
            <div style={styles.group}>
              <div style={styles.groupTitle}>Tin tức</div>

              {suggestions.news.map((item) => (
                <button
                  key={`news-${item.id}`}
                  type="button"
                  style={styles.item}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/news/${item.slug}`);
                  }}
                >
                  <div style={styles.main}>{item.title}</div>
                  <div style={styles.sub}>
                    {item.summary || "Bài viết tin tức"}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    height: 54,
    padding: "0 16px",
    borderRadius: 14,
    border: "1px solid #d9d9d9",
    outline: "none",
    fontSize: 15,
    background: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: 16,
    boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 20,
  },
  group: {
    padding: 10,
    borderBottom: "1px solid #f1f1f1",
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#999",
    padding: "6px 10px",
    textTransform: "uppercase",
  },
  item: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    display: "grid",
    gap: 4,
  },
  main: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
  },
  sub: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5,
  },
};
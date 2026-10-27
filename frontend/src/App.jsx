
import gsap from "gsap";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Moon,
  ShoppingBag,
  Sun,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";
const PAGE_SIZE = 10;

const COLORS = {
  highValue: "#a78bfa",
  regular: "#38bdf8",
  atRisk: "#fb923c",
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatCompactMoney = (value) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString("en-GB");

const getSegmentColor = (cluster) =>
  Number(cluster) === 1
    ? COLORS.highValue
    : Number(cluster) === 2
      ? COLORS.atRisk
      : COLORS.regular;

const getSegmentName = (cluster, segments = []) => {
  const found = segments.find(
    (s) => Number(s.cluster) === Number(cluster)
  );

  if (found) return found.name;
  if (Number(cluster) === 0) return "Regular-value customers";
  if (Number(cluster) === 1) return "High-value loyal customers";
  if (Number(cluster) === 2) return "At-risk / inactive customers";

  return `Cluster ${cluster}`;
};

// Respect reduced-motion accessibility settings.
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Visible entrance animation for each page.
function usePageAnimation(dependencies = []) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".topbar, .welcome-row",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "all",
        }
      );

      gsap.fromTo(
        "[data-gsap='kpi']",
        { opacity: 0, y: 35, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.13,
          delay: 0.15,
          ease: "back.out(1.4)",
          clearProps: "all",
        }
      );

      gsap.fromTo(
        "[data-gsap='panel']",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.14,
          delay: 0.25,
          ease: "power3.out",
          clearProps: "all",
        }
      );
    }, element);

    return () => ctx.revert();
  }, dependencies);

  return ref;
}

// Animate KPI numbers from zero to their real values.
function AnimatedValue({ value, formatter = formatNumber }) {
  const nodeRef = useRef(null);
  const numericValue = Number(value) || 0;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (reducedMotion()) {
      node.textContent = formatter(numericValue);
      return;
    }

    const counter = { value: 0 };

    const tween = gsap.to(counter, {
      value: numericValue,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        node.textContent = formatter(counter.value);
      },
    });

    return () => tween.kill();
  }, [numericValue, formatter]);

  return <span ref={nodeRef}>{formatter(0)}</span>;
}

function Sidebar({ page, setPage, theme, setTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div>
          <h2>MIZAN</h2>
          <p>Customer Intelligence</p>
        </div>
      </div>

      <p className="nav-label">WORKSPACE</p>

      <nav className="nav-menu">
        <button
          className={`nav-item ${page === "overview" ? "active" : ""}`}
          onClick={() => setPage("overview")}
          type="button"
        >
          <LayoutDashboard size={19} />
          <span>Overview</span>
        </button>

        <button
          className={`nav-item ${page === "customers" ? "active" : ""}`}
          onClick={() => setPage("customers")}
          type="button"
        >
          <Users size={19} />
          <span>Customer Explorer</span>
        </button>

        <button
          className={`nav-item ${page === "insights" ? "active" : ""}`}
          onClick={() => setPage("insights")}
          type="button"
        >
          <ChartNoAxesCombined size={19} />
          <span>Business Insights</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="nav-item theme-toggle"
          type="button"
          onClick={() =>
            setTheme((current) =>
              current === "dark" ? "light" : "dark"
            )
          }
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          <span>
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </span>
        </button>

        <div className="project-label">
          <span className="status-dot" />
          API data connected
        </div>
      </div>
    </aside>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;
  const cardRef = useRef(null);

  function handleMouseEnter() {
    if (reducedMotion() || !cardRef.current) return;

    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.015,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  return (
    <article
      ref={cardRef}
      className="stat-card"
      data-gsap="kpi"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stat-top">
        <span className="stat-title">{stat.title}</span>
        <span className="stat-icon">
          <Icon size={20} />
        </span>
      </div>

      <h3>{stat.value}</h3>
      <p className="stat-note">{stat.note}</p>
    </article>
  );
}

function RevenueBar({ segment }) {
  const barRef = useRef(null);
  const percentage = Math.min(
    100,
    Math.max(0, Number(segment.percentage) || 0)
  );

  useEffect(() => {
    if (!barRef.current) return;

    if (reducedMotion()) {
      gsap.set(barRef.current, { width: `${percentage}%` });
      return;
    }

    const tween = gsap.fromTo(
      barRef.current,
      { width: "0%" },
      {
        width: `${percentage}%`,
        duration: 1.2,
        delay: 0.25,
        ease: "power3.out",
      }
    );

    return () => tween.kill();
  }, [percentage]);

  return (
    <div className="revenue-bar-row">
      <div className="bar-label">
        <span>{segment.name}</span>
        <strong>{percentage.toFixed(2)}%</strong>
      </div>

      <div className="share-track">
        <div
          ref={barRef}
          className="share-fill"
          style={{ width: "0%", backgroundColor: segment.color }}
        />
      </div>
    </div>
  );
}


const metricOptions = [
  {
    value: "avg_recency",
    label: "Average recency",
    unit: "Days",
    format: (value) => `${Number(value || 0).toFixed(0)} days`,
  },
  {
    value: "avg_frequency",
    label: "Average frequency",
    unit: "Orders",
    format: (value) => Number(value || 0).toFixed(2),
  },
  {
    value: "avg_monetary",
    label: "Average monetary value",
    unit: "GBP",
    format: (value) =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2,
      }).format(Number(value) || 0),
  },
];

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload || {};

  return (
    <div className="chart-tooltip">
      <strong>{item.name || label}</strong>

      {payload.map((entry) => (
        <div
          className="chart-tooltip-line"
          key={entry.dataKey || entry.name}
        >
          <span
            className="chart-tooltip-dot"
            style={{
              background: entry.color || entry.fill,
            }}
          />

          <span>{entry.name || entry.dataKey}</span>

          <b>
            {formatter
              ? formatter(entry.value)
              : Number(entry.value || 0).toLocaleString("en-GB")}
          </b>
        </div>
      ))}

      {item.percentage !== undefined && (
        <small>{Number(item.percentage).toFixed(2)}% of customers</small>
      )}
    </div>
  );
}

function AnalyticsCharts({ segments = [], summary,onSelectSegment, }) {
  const [selectedMetric, setSelectedMetric] = useState("avg_monetary");

  const chartData = segments.map((segment) => ({
    ...segment,
    name: segment.name || `Cluster ${segment.cluster}`,
    customers: Number(segment.customers) || 0,
    revenue: Number(segment.revenue) || 0,
    percentage: Number(segment.percentage) || 0,
    color: segment.color || getSegmentColor(segment.cluster),
  }));

  const customerTotal =
    chartData.reduce((sum, segment) => sum + segment.customers, 0) ||
    Number(summary?.total_customers) ||
    0;

  const distributionData = chartData.map((segment) => ({
    ...segment,
    percentage: customerTotal
      ? (segment.customers / customerTotal) * 100
      : 0,
  }));

  const selected =
    metricOptions.find((metric) => metric.value === selectedMetric) ||
    metricOptions[2];

  const behaviorData = [...chartData].sort(
    (a, b) =>
      Number(b[selectedMetric] || 0) -
      Number(a[selectedMetric] || 0)
  );

  return (
    <section
      className="analytics-section"
      aria-label="Interactive customer analytics"
    >
      <div className="analytics-section-heading">
        <div>
          <p className="eyebrow">EXPLORE THE DATA</p>
          <h2>Interactive analytics</h2>
          <p>
            Explore customer distribution and compare segment behavior.
          </p>
        </div>

        <span className="analytics-live-label">
          <span className="status-dot" />
          Live segment data
        </span>
      </div>

      <div className="analytics-chart-grid">
        {/* Customer distribution donut chart */}
        <article className="panel chart-panel" data-gsap="panel">
          <div className="panel-heading">
            <div>
              <h2>Customer distribution</h2>
              <p>How customers are split across segments</p>
            </div>
            <Users size={20} />
          </div>

          {distributionData.length > 0 ? (
            <>
              <div className="chart-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="customers"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="84%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {distributionData.map((segment) => (
                        <Cell
                          key={segment.cluster}
                          fill={segment.color}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("mizan:select-cluster", {
                                detail: segment.cluster,
                              })
                            )
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      content={
                        <ChartTooltip
                          formatter={(value) =>
                            Number(value || 0).toLocaleString("en-GB")
                          }
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>
                    {customerTotal.toLocaleString("en-GB")}
                  </strong>
                  <span>customers</span>
                </div>
              </div>

              <div className="chart-legend-list">
                {distributionData.map((segment) => (
                  <div
                    className="chart-legend-item"
                    key={segment.cluster}
                  >
                    <span className="chart-legend-name">
                      <i style={{ background: segment.color }} />
                      {segment.name}
                    </span>

                    <strong>
                      {segment.percentage.toFixed(1)}%
                    </strong>

                    <small>
                      {segment.customers.toLocaleString("en-GB")}
                    </small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-empty">
              Customer distribution will appear when segment data is available.
            </div>
          )}
        </article>

        {/* Interactive customer behavior chart */}
        <article
          className="panel chart-panel chart-panel-behavior"
          data-gsap="panel"
        >
          <div className="panel-heading chart-heading-responsive">
            <div>
              <h2>Customer behavior</h2>
              <p>Choose a metric to compare segment averages</p>
            </div>

            <select
              className="chart-metric-select"
              aria-label="Customer behavior metric"
              value={selectedMetric}
              onChange={(event) =>
                setSelectedMetric(event.target.value)
              }
            >
              {metricOptions.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          <div className="chart-metric-caption">
            <span>{selected.label}</span>
            <strong>{selected.unit}</strong>
          </div>

          {behaviorData.length > 0 ? (
            <div className="chart-canvas chart-canvas-behavior">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={behaviorData}
                  layout="vertical"
                  margin={{
                    top: 4,
                    right: 20,
                    left: 12,
                    bottom: 4,
                  }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="3 5"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fill: "var(--chart-text)",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={
                      selectedMetric === "avg_monetary"
                        ? (value) =>
                            new Intl.NumberFormat("en-GB", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(Number(value) || 0)
                        : (value) => Number(value).toFixed(0)
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{
                      fill: "var(--chart-text)",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  
<Tooltip
  content={({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const segment = payload[0].payload;
    const totalRevenue = Number(summary?.total_revenue) || 0;
    const revenue = Number(segment.revenue) || 0;

    const revenueShare = totalRevenue
      ? (revenue / totalRevenue) * 100
      : 0;

    return (
      <div className="chart-tooltip">
        <strong>{segment.name}</strong>

        <div className="chart-tooltip-line">
          <span
            className="chart-tooltip-dot"
            style={{ background: segment.color }}
          />
          <span>Revenue</span>
          <b>{formatMoney(revenue)}</b>
        </div>

        <div className="chart-tooltip-line">
          <span>Revenue contribution</span>
          <b>{revenueShare.toFixed(2)}%</b>
        </div>
      </div>
    );
  }}
  cursor={{ fill: "var(--chart-cursor)" }}
/>


                  <Bar
                    dataKey={selectedMetric}
                    name={selected.label}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={32}
                  >
                    {behaviorData.map((segment) => (
                      <Cell
                        key={segment.cluster}
                        fill={segment.color}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("mizan:select-cluster", {
                              detail: segment.cluster,
                            })
                          )
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              Customer behavior metrics will appear when segment data is available.
            </div>
          )}

          <p className="chart-footnote">
            Segment averages are descriptive summaries, not predictions.
          </p>
        </article>
      </div>
    </section>
  );
}


function SegmentList({ segments = [] }) {
  return (
    <section className="panel" id="segments" data-gsap="panel">
      <div className="panel-heading">
        <div>
          <h2>Customer segments</h2>
          <p>Overview of the groups discovered by K-Means</p>
        </div>
        <span className="badge">{segments.length} segments</span>
      </div>

      <div className="segment-list">
        {segments.map((segment, index) => {
          const color = segment.color || COLORS.regular;
          const percentage = Math.min(
            100,
            Math.max(0, Number(segment.percentage) || 0)
          );

          return (
            <article
              className="segment-row"
              key={segment.cluster ?? index}
            >
              <span
                className="segment-dot"
                style={{ backgroundColor: color }}
              />

              <div className="segment-info">
                <h3>{segment.name || "Unnamed segment"}</h3>
                <p>{segment.description || ""}</p>
              </div>

              <div className="segment-metric">
                <strong>{formatNumber(segment.customers)}</strong>
                <span>Customers</span>
              </div>

              <div className="segment-metric">
                <strong>{formatCompactMoney(segment.revenue)}</strong>
                <span>Revenue</span>
              </div>

              <div className="segment-share">
                <div className="share-track">
                  <div
                    className="share-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span>{percentage.toFixed(2)}% revenue</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DashboardOverview({ summary, segments, loading, error, retry }) {
  const animationRef = usePageAnimation([loading, segments.length]);

  const highValueSegment = segments.find(
    (s) => Number(s.cluster) === 1
  );

  const atRiskSegment = segments.find(
    (s) => Number(s.cluster) === 2
  );

  const highValueCustomerShare =
    summary?.total_customers > 0 && highValueSegment
      ? (
          (Number(highValueSegment.customers) /
            Number(summary.total_customers)) *
          100
        ).toFixed(1)
      : null;

  const stats = [
    {
      title: "Total Customers",
      value: summary ? (
        <AnimatedValue value={summary.total_customers} />
      ) : "—",
      note: "Customers analyzed",
      icon: Users,
    },
    {
      title: "Total Revenue",
      value: summary ? (
        <AnimatedValue
          value={summary.total_revenue}
          formatter={formatCompactMoney}
        />
      ) : "—",
      note: "Across all segments",
      icon: CircleDollarSign,
    },
    {
      title: "Average Orders",
      value: summary ? (
        <AnimatedValue
          value={summary.average_frequency}
          formatter={(n) => Number(n).toFixed(2)}
        />
      ) : "—",
      note: "Orders per customer",
      icon: ShoppingBag,
    },
    {
      title: "Customer Segments",
      value: summary ? (
        <AnimatedValue value={summary.total_clusters} />
      ) : "—",
      note: "Identified using K-Means",
      icon: UserRoundCheck,
    },
  ];

  return (
    <div ref={animationRef} className="dashboard-content">
      <header className="topbar">
        <div>
          <p className="eyebrow">CUSTOMER ANALYTICS / OVERVIEW</p>
          <h1>Customer intelligence</h1>
        </div>
      </header>

      <section className="welcome-row">
        <div>
          <h2>Your customers, understood.</h2>
          <p>
            Explore customer behavior, spending patterns and segment value.
          </p>
        </div>

        <span className="model-status">
          <span className="status-dot" />
          K-Means · {summary?.total_clusters ?? "—"} clusters
        </span>
      </section>

      {loading && <p className="muted-text">Loading analytics...</p>}

      {error && (
        <article className="panel" role="alert">
          <h2>Unable to load dashboard data</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={retry} type="button">
            Retry
          </button>
        </article>
      )}

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="insight-grid" id="insights">
        <article className="panel revenue-panel" data-gsap="panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue contribution</h2>
              <p>Share of revenue by customer segment</p>
            </div>
            <ChartNoAxesCombined size={20} />
          </div>

          <div className="revenue-total">
            {summary ? formatMoney(summary.total_revenue) : "—"}
          </div>

          <p className="muted-text">Total merchandise revenue analyzed</p>

         
<div className="chart-canvas chart-canvas-revenue">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={[...segments].sort(
        (a, b) => Number(b.revenue) - Number(a.revenue)
      )}
      layout="vertical"
      margin={{ top: 8, right: 18, left: 8, bottom: 8 }}
      barCategoryGap="28%"
    >
      <CartesianGrid
        stroke="var(--chart-grid)"
        strokeDasharray="3 5"
        horizontal={false}
      />

      <XAxis
        type="number"
        tick={{
          fill: "var(--chart-text)",
          fontSize: 10,
        }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) =>
          new Intl.NumberFormat("en-GB", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(Number(value) || 0)
        }
      />

      <YAxis
        type="category"
        dataKey="name"
        width={150}
        tick={{
          fill: "var(--chart-text)",
          fontSize: 10,
        }}
        tickLine={false}
        axisLine={false}
      />

      <Tooltip
        content={
          <ChartTooltip
            formatter={(value) => formatMoney(value)}
          />
        }
        cursor={{ fill: "var(--chart-cursor)" }}
      />

      <Bar
        dataKey="revenue"
        name="Revenue"
        radius={[0, 6, 6, 0]}
        maxBarSize={34}
        animationDuration={800}
      >
        {[...segments]
          .sort((a, b) => Number(b.revenue) - Number(a.revenue))
          .map((segment) => (
            <Cell
              key={segment.cluster}
              fill={segment.color || getSegmentColor(segment.cluster)}
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("mizan:select-cluster", {
                    detail: segment.cluster,
                  })
                )
              }
            />
          ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

        </article>

        <article className="panel takeaway-panel" data-gsap="panel">
          <div className="panel-heading">
            <div>
              <h2>Key business insight</h2>
              <p>What the segmentation tells us</p>
            </div>
            <Clock3 size={20} />
          </div>

          <div className="insight-highlight">
            <span className="insight-icon">
              <ArrowUpRight size={22} />
            </span>
            <div>
              <strong>
                {highValueSegment && highValueCustomerShare !== null
                  ? `${highValueCustomerShare}% of customers drive ${Number(
                      highValueSegment.percentage
                    ).toFixed(2)}% of revenue`
                  : "High-value customer insights"}
              </strong>
              <p>
                {highValueSegment
                  ? `${highValueSegment.name} contribute the largest share of revenue. Consider loyalty rewards and retention campaigns.`
                  : "High-value segment information will appear when API data is available."}
              </p>
            </div>
          </div>

          <div className="insight-highlight">
            <span className="insight-icon orange">
              <ArrowDownRight size={22} />
            </span>
            <div>
              <strong>
                {atRiskSegment
                  ? `${formatNumber(atRiskSegment.customers)} customers may need re-engagement`
                  : "Customer re-engagement"}
              </strong>
              <p>
                {atRiskSegment
                  ? `This segment has an average recency of ${Math.round(
                      Number(atRiskSegment.avg_recency) || 0
                    )} days. Consider targeted win-back campaigns.`
                  : "At-risk customer information will appear when API data is available."}
              </p>
            </div>
          </div>
        </article>
      </section>

      <AnalyticsCharts
  segments={segments}
  summary={summary}
/>

<SegmentList segments={segments} /> 

      <SegmentList segments={segments} />

      <footer className="page-footer">
        <span>MIZAN · Customer &amp; Business Intelligence</span>
        <span>Model: K-Means · {summary?.total_clusters ?? "—"} clusters</span>
      </footer>
    </div>
  );
}

function CustomerExplorer({ segments = [], initialCluster = "all" }) {
  const animationRef = usePageAnimation([]);
  const [retryCount, setRetryCount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [clusterFilter, setClusterFilter] = useState(String(initialCluster));
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(page * PAGE_SIZE),
        });

        if (search.trim()) params.set("search", search.trim());
        if (clusterFilter !== "all") {
          params.set("cluster", clusterFilter);
        }

        const response = await fetch(
          `${API_URL}/api/customers?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || `Request failed (${response.status})`);
        }

        const data = await response.json();
        setCustomers(data.results || []);
        setTotal(Number(data.total) || 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Could not load customers.");
          setCustomers([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, clusterFilter, page, retryCount]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const firstRecord = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastRecord = Math.min((page + 1) * PAGE_SIZE, total);

  const segmentNames = {
    0: "Regular-value",
    1: "High-value loyal",
    2: "At-risk / inactive",
  };

  return (
    <section className="customer-panel" ref={animationRef}>
      <header className="topbar">
        <div>
          <p className="eyebrow">CUSTOMER ANALYTICS / EXPLORER</p>
          <h1>Customer Explorer</h1>
        </div>
      </header>

      <div className="panel" data-gsap="panel">
        <div className="panel-header">
          <div>
            <h2>Customer records</h2>
            <p>Search and explore customers across all segments.</p>
          </div>
          <span className="customer-count">
            {total.toLocaleString("en-GB")} matching customers
          </span>
        </div>

        <div className="customer-controls">
          <div className="customer-search">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by customer ID..."
              aria-label="Search by customer ID"
              inputMode="numeric"
            />
          </div>

          <select
            className="cluster-select"
            value={clusterFilter}
            onChange={(e) => {
              setClusterFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by customer segment"
          >
            <option value="all">All segments</option>
            <option value="0">Regular-value customers</option>
            <option value="1">High-value loyal customers</option>
            <option value="2">At-risk / inactive customers</option>
          </select>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <strong>Could not load customers.</strong>
            <p>{error}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => setRetryCount((n) => n + 1)}
            >
              Retry
            </button>
          </div>
        )}

        <div className="table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Recency (days)</th>
                <th>Frequency</th>
                <th>Monetary value</th>
                <th>Segment</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={5}>Loading customer records...</td></tr>
              ) : error ? (
                <tr><td colSpan={5}>Customer data is temporarily unavailable.</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5}>No matching customers found.</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.recency ?? "—"}</td>
                    <td>{customer.frequency ?? "—"}</td>
                    <td>{formatMoney(customer.monetary)}</td>
                    <td>
                      <span className={`segment-badge cluster-${customer.cluster}`}>
                        {segmentNames[Number(customer.cluster)] ||
                          getSegmentName(customer.cluster, segments)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing {firstRecord.toLocaleString("en-GB")}–
            {lastRecord.toLocaleString("en-GB")} of {total.toLocaleString("en-GB")}
          </span>

          <div className="pagination-actions">
            <button
              className="pagination-button"
              type="button"
              disabled={loading || page === 0 || totalPages === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>

            <span>
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>

            <button
              className="pagination-button"
              type="button"
              disabled={loading || page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessInsights({ summary, segments }) {
  const animationRef = usePageAnimation([]);

  const stats = [
    {
      title: "Total Revenue",
      value: formatCompactMoney(summary?.total_revenue),
      note: "Across all customers",
      icon: CircleDollarSign,
    },
    {
      title: "Customer Segments",
      value: String(summary?.total_clusters ?? "—"),
      note: "Identified by K-Means",
      icon: Users,
    },
    {
      title: "Average Orders",
      value: summary ? Number(summary.average_frequency).toFixed(2) : "—",
      note: "Orders per customer",
      icon: ShoppingBag,
    },
    {
      title: "Customers Analyzed",
      value: formatNumber(summary?.total_customers),
      note: "In the current dataset",
      icon: UserRoundCheck,
    },
  ];

  return (
    <div ref={animationRef} className="dashboard-content">
      <header className="topbar">
        <div>
          <p className="eyebrow">WORKSPACE / ANALYTICS</p>
          <h1>Business Insights</h1>
        </div>
      </header>

      <section className="welcome-row">
        <div>
          <h2>Turn segments into decisions.</h2>
          <p>Explore the value and behavior of each customer group.</p>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <SegmentList segments={segments} />

      <footer className="page-footer">
        <span>MIZAN · Customer &amp; Business Intelligence</span>
        <span>Insights derived from RFM and K-Means</span>
      </footer>
    </div>
  );
}

function Dashboard() {
  const [page, setPage] = useState("overview");
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("mizan-theme") || "dark"
  );
  const [summary, setSummary] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("mizan-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleSegmentSelection = (event) => {
      setSelectedCluster(String(event.detail));
      setPage("customers");
    };

    window.addEventListener("mizan:select-cluster", handleSegmentSelection);
    return () =>
      window.removeEventListener("mizan:select-cluster", handleSegmentSelection);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [summaryResponse, segmentsResponse] = await Promise.all([
          fetch(`${API_URL}/api/summary`),
          fetch(`${API_URL}/api/segments`),
        ]);

        if (!summaryResponse.ok) {
          throw new Error(`Summary API returned ${summaryResponse.status}`);
        }

        if (!segmentsResponse.ok) {
          throw new Error(`Segments API returned ${segmentsResponse.status}`);
        }

        const summaryData = await summaryResponse.json();
        const rawSegmentsData = await segmentsResponse.json();

        if (
          !Array.isArray(rawSegmentsData) ||
          typeof summaryData !== "object" ||
          summaryData === null
        ) {
          throw new Error("The API returned an unexpected data format.");
        }

        const segmentsData = rawSegmentsData.map((segment) => ({
          ...segment,
          name: segment.segment_name,
          customers: Number(segment.customer_count) || 0,
          revenue: Number(segment.total_revenue) || 0,
          percentage: Number(segment.revenue_percentage) || 0,
          color: getSegmentColor(segment.cluster),
        }));

        if (!cancelled) {
          setSummary(summaryData);
          setSegments(segmentsData);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        if (!cancelled) {
          setError(err.message || "Could not load dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`app-shell ${theme === "light" ? "light-theme" : ""}`}>
      <Sidebar
        page={page}
        setPage={setPage}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="main-content" key={page}>
        {page === "overview" && (
          <DashboardOverview
            summary={summary}
            segments={segments}
            loading={loading}
            error={error}
            retry={() => window.location.reload()}
          />
        )}

        {page === "customers" && (
          <CustomerExplorer
            segments={segments}
            initialCluster={selectedCluster}
          />
        )}

        {page === "insights" && (
          <BusinessInsights summary={summary} segments={segments} />
        )}
      </main>
    </div>
  );
}

export default Dashboard;

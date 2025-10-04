import styles from "./page.module.css";
import SocketStatus from "./SocketStatus";
import KpiRow from "./components/KpiRow";
import FilterBar from "./components/FilterBar";
import LiveFeed from "./components/LiveFeed";

export default function Home() {
  return (
    <main className={styles.main} style={{ gap: 24 }}>
      <div className={styles.description} style={{ justifyContent: "space-between", width: "100%" }}>
        <p style={{ fontWeight: 600 }}>Live Events Dashboard — M2 Shell</p>
        <SocketStatus />
      </div>

      <section style={{ width: "100%" }}>
        <KpiRow />
      </section>

      <section style={{ width: "100%" }}>
        <FilterBar />
      </section>

      <section style={{ width: "100%" }}>
        <LiveFeed />
      </section>
    </main>
  );
}

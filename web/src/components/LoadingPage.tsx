import React from "react";
import { Skeleton, Card, Row, Col } from "antd";

export default function LoadingPage() {
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <Skeleton
          active
          title={{ width: "60%" }}
          paragraph={{ rows: 1, width: "80%" }}
        />
        <Row gutter={16}>
          <Col span={8}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Col>
          <Col span={8}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Col>
          <Col span={8}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "800px",
  },
};

-- 创建报告分享表
CREATE TABLE IF NOT EXISTS report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_report_shares_slug ON report_shares(slug);
CREATE INDEX IF NOT EXISTS idx_report_shares_expires ON report_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id);

-- 启用 RLS
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看有效的分享（通过 slug 访问公开报告）
CREATE POLICY "Anyone can view valid shares" ON report_shares
  FOR SELECT USING (
    expires_at > NOW()
  );

-- 认证用户可以创建分享
CREATE POLICY "Auth users can create shares" ON report_shares
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 报告作者可以删除自己的分享
CREATE POLICY "Report owners can delete shares" ON report_shares
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = report_shares.report_id
      AND reports.user_id = auth.uid()
    )
  );

-- 添加 is_public 字段到 reports 表（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'reports'
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE reports ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 添加 slug 字段到 reports 表（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'reports'
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE reports ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  print_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  neck_label_price INTEGER NOT NULL DEFAULT 30,
  packaging_price INTEGER NOT NULL DEFAULT 30,
  gst_rate NUMERIC NOT NULL DEFAULT 5,
  neck_label_mode TEXT NOT NULL DEFAULT 'per_item' CHECK (neck_label_mode IN ('per_item', 'per_order')),
  packaging_mode TEXT NOT NULL DEFAULT 'per_item' CHECK (packaging_mode IN ('per_item', 'per_order')),
  gst_applies_to_print BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT,
  design TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  print_code TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'made', 'picked_up', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (all users can view and edit)
CREATE POLICY "Allow public read access to settings"
  ON public.settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to settings"
  ON public.settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to settings"
  ON public.settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to orders"
  ON public.orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to orders"
  ON public.orders FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to orders"
  ON public.orders FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
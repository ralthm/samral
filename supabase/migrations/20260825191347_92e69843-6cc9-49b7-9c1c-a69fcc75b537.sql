CREATE POLICY "Card images are readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'card-images');
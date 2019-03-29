echo 'Moving local data/ folder out of dist/'
mv dist/data/ .

echo 'Building with webpack'
webpack --env.dataURL='github' --mode production

echo 'Moving local data/ back to dist/'
mv data/ dist/

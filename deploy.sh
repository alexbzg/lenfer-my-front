chown web_ftp:www-data src -R
chmod o+w src -R
chmod g+w public -R
rm /var/www/lenfer-my/js/*
cp /var/www/lenfer-my-dev/dist/js/* /var/www/lenfer-my/js/
rm /var/www/lenfer-my/css/*
cp /var/www/lenfer-my-dev/dist/css/* /var/www/lenfer-my/css/
cp /var/www/lenfer-my-dev/dist/images/* /var/www/lenfer-my/images -r
cp /var/www/lenfer-my-dev/dist/index.html /var/www/lenfer-my/
cp /var/www/lenfer-my-dev/dist/favicon.ico /var/www/lenfer-my/

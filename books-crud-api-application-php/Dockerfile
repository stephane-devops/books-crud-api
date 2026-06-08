FROM bref/php-83:2

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/task

# Copy existing application directory contents
COPY . /var/task

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# The CMD should be the handler for Lambda.
# For Bref PHP runtime (not FPM), this is the filename (without extension).
CMD ["index.php"]

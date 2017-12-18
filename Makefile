all:
	jekyll build -d /var/www/html
gh:
	jekyll build -c _gh_config.yml -d docs
serve:
	bundle exec jekyll serve --drafts
clean:
	rm -rf docs .sass-cache _site

all:
	jekyll build
static:
	jekyll build -d ../brettjsettle.github.io-static
serve:
	bundle exec jekyll serve --drafts
clean:
	rm -rf _site .sass-cache

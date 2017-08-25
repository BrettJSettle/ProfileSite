all:
	jekyll build
build:
	set -e
	jekyll build
	git checkout master
	cp -r _site/* .
	rm -rf _site
serve:
	bindle exec jekyll serve --drafts
clean:
	rm -rf _site .sass-cache

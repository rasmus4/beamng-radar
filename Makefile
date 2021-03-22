.PHONY: clean

radar.zip : app.js app.json app.png
	mkdir -p build/ui/modules/apps/radar
	cp app.js build/ui/modules/apps/radar
	cp app.json build/ui/modules/apps/radar
	cp app.png build/ui/modules/apps/radar
	cd build && zip -r radar.zip ui
	rm -r build/ui

clean :
	rm build/radar.zip

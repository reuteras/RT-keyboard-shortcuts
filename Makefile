test: rtkeyboardshortcuts.user.js
	java -jar /home/hudson/addons/lib/jslint4java.jar rtkeyboardshortcuts.user.js > rtkeyboardshortcuts.user.js.jslint.out
clean: 
	rm -f *.out

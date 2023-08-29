REPO_OWNER := harshit9436
REPO_NAME := Pollution-Dashboard
BRANCH := main

# Define the target to push changes
push:
	@git add .
	@git commit -m "Update"
	@git push origin $(BRANCH)
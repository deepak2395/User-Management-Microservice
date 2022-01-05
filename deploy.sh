# rename docker file
#sed -i 's/stage1/staging/g;s/stage2/staging/g;s/stage3/staging/g;s/stage4/staging/g;' dockerfile
# generate image
sudo docker build -t barclay_app_user_management .
# tag image
sudo docker tag barclay_app_user_management us.gcr.io/barclay-302706/barclay_app_user_management:v$1
# push image
sudo docker push us.gcr.io/barclay-302706/barclay_app_user_management:v$1

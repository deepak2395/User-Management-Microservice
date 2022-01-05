# rename docker file
#sed -i 's/staging/stage1/g;s/stage2/stage1/g;s/stage3/stage1/g;s/stage4/stage1/g;' dockerfile
# generate image
sudo docker build -t stage1_umobile_app_user_management .
# tag image
sudo docker tag stage1_umobile_app_user_management asia.gcr.io/um-stage-1/stage1_umobile_app_user_management:v$1
# push image
sudo docker push asia.gcr.io/um-stage-1/stage1_umobile_app_user_management:v$1
import cv2


cam = cv2.VideoCapture(0)
i = 0

while True:
	ret, frame = cam.read()
	cv2.imshow('img', frame)
	if cv2.waitKey(1) & 0xFF == 32:
		cv2.imwrite(f'avatars/%d.JPG'%(i,), frame)
		print('Saved')
		i += 1

	if cv2.waitKey(1) & 0xFF == 27:
		break

cv2.destroyAllWindows()
cam.release()
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


class RefreshTokenView(APIView):
    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                return Response({
                    'result': 'refresh token 不存在'
                }, status=401)  # 必须加上401
            refresh = RefreshToken(refresh_token)  # 如果 refresh token 过期，报异常

            if settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS']:  # 将settings中配置引入，为 True 时，当 refresh_token 刷新 access_token的时候同时刷新 refresh_token
                refresh.set_jti()
                response = Response({
                    'result': 'success',
                    'access': str(refresh.access_token),
                })
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    samesite='Lax',
                    secure=True,
                    max_age= 86400 * 7,  # refresh 7 天有效
                )
                return response
            return Response({
                'result': 'success',
                'access': str(refresh.access_token),
            })

        except:
            return Response({
                'result': 'refresh token 已过期'
            }, status=401)  # 必须加上401
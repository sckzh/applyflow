package methods.impls;

import mappers.userMapper;
import methods.interfaces.Methods;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.InputStream;

public class UserMethods implements Methods {
    @Override
    public void setUpUserTable() throws IOException {
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.createTable();
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public void addUser(String username , String password, String email) throws IOException{
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
    }

}

package daoImpls;

import daos.userDao;
import daos.userDetailedMessageDao;
import mappers.userDetailedMessageMapper;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.InputStream;

import static daoImpls.userDaoImpl.SQL_SESSION_FACTORY;

public class userDetailedMessageDaoImpl implements userDetailedMessageDao {

    @Override
    public void createUserDetailedMessageTable() {
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userDetailedMessageMapper userDetailedMessageMapper = sqlSession.getMapper(userDetailedMessageMapper.class);
        userDetailedMessageMapper.createUserDetailedMessageTable();
        sqlSession.commit();
        sqlSession.close();
    }

}

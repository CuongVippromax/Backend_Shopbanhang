package com.cuong.shopbanhang.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.model.User;
import com.cuong.shopbanhang.repository.UserRepository;
import com.cuong.shopbanhang.security.UserPrincipal;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String usernameoremail) throws UsernameNotFoundException {
                User user = userRepository.findByUsername(usernameoremail)
                                .orElseGet(() -> userRepository.findByEmail(usernameoremail)
                                                .orElseThrow(() -> new UsernameNotFoundException(
                                                                "User not found: " + usernameoremail)));

                return UserPrincipal.create(user);
        }

        @Transactional
        public UserDetails loadUserById(long id) {
                User user = userRepository.findByUserId(id)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found with id " + id));
                return UserPrincipal.create(user);
        }

}

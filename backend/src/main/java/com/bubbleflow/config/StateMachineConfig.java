package com.bubbleflow.config;

import com.bubbleflow.entity.state.OrderEvent;
import com.bubbleflow.entity.state.OrderState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class StateMachineConfig extends EnumStateMachineConfigurerAdapter<OrderState, OrderEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states) throws Exception {
        states
            .withStates()
            .initial(OrderState.RECEIVED)
            .states(EnumSet.allOf(OrderState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(OrderState.RECEIVED).target(OrderState.SORTING).event(OrderEvent.SORT)
                .and()
            .withExternal()
                .source(OrderState.SORTING).target(OrderState.WASHING).event(OrderEvent.WASH)
                .and()
            .withExternal()
                .source(OrderState.WASHING).target(OrderState.DRYING).event(OrderEvent.DRY)
                .and()
            .withExternal()
                .source(OrderState.DRYING).target(OrderState.AWAITING_DELIVERY).event(OrderEvent.AWAIT_DELIVERY)
                .and()
            .withExternal()
                .source(OrderState.AWAITING_DELIVERY).target(OrderState.COMPLETED).event(OrderEvent.COMPLETE)
                .and()
            // Allow flexibility if sorting is skipped
            .withExternal()
                .source(OrderState.RECEIVED).target(OrderState.WASHING).event(OrderEvent.WASH)
                .and()
            .withExternal()
                .source(OrderState.SORTING).target(OrderState.DRYING).event(OrderEvent.DRY)
                .and()
            .withExternal()
                .source(OrderState.WASHING).target(OrderState.AWAITING_DELIVERY).event(OrderEvent.AWAIT_DELIVERY)
                .and()
            .withExternal()
                .source(OrderState.DRYING).target(OrderState.COMPLETED).event(OrderEvent.COMPLETE);
    }
}
